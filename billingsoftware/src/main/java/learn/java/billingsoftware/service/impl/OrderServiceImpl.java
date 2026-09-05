package learn.java.billingsoftware.service.impl;

import learn.java.billingsoftware.entity.OrderEntity;
import learn.java.billingsoftware.entity.OrderItemEntity;
import learn.java.billingsoftware.io.OrderRequest;
import learn.java.billingsoftware.io.OrderResponse;
import learn.java.billingsoftware.io.PaymentDetails;
import learn.java.billingsoftware.io.PaymentMethod;
import learn.java.billingsoftware.repository.OrderEntityRepository;
import learn.java.billingsoftware.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.exception.PayOSException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import learn.java.billingsoftware.entity.InventoryTransactionEntity;
import learn.java.billingsoftware.entity.TransactionType;
import learn.java.billingsoftware.entity.VariantEntity;
import learn.java.billingsoftware.io.SelectedModifier;
import learn.java.billingsoftware.repository.InventoryTransactionRepository;
import learn.java.billingsoftware.repository.VariantRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderEntityRepository orderEntityRepository;
    private final PayOS payOS;
    private final VariantRepository variantRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        OrderEntity newOrder = convertToOrderEntity(request); 

        PaymentDetails paymentDetails = new PaymentDetails(); 
        paymentDetails.setStatus(newOrder.getPaymentMethod() == PaymentMethod.CASH ? 
                PaymentDetails.PaymentStatus.COMPLETED : PaymentDetails.PaymentStatus.PENDING); 
        newOrder.setPaymentDetails(paymentDetails); 

        List<OrderItemEntity> orderItems = request.getCartItems().stream() 
                .map(this::convertToOrderItemEntity) 
                .collect(Collectors.toList()); 

        OrderEntity finalNewOrder = newOrder; 
        orderItems.forEach(item -> item.setOrder(finalNewOrder)); 
        newOrder.setItems(orderItems); 

        // Lưu lần 1 để lấy ID (dùng làm orderCode cho PayOS)
        newOrder = orderEntityRepository.save(newOrder); 

        // Tự động đồng bộ xuất kho vào sổ cái InventoryTransaction cho từng variant
        for (OrderItemEntity item : newOrder.getItems()) {
            VariantEntity variant = null;
            if (item.getVariantId() != null && !item.getVariantId().trim().isEmpty()) {
                variant = variantRepository.findByVariantId(item.getVariantId()).orElse(null);
            } else if (item.getItemId() != null) {
                List<VariantEntity> variants = variantRepository.findByItem_ItemId(item.getItemId());
                if (!variants.isEmpty()) {
                    variant = variants.get(0);
                }
            }

            if (variant != null) {
                int soldQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                InventoryTransactionEntity transaction = InventoryTransactionEntity.builder()
                        .transactionId(UUID.randomUUID().toString())
                        .variant(variant)
                        .transactionType(TransactionType.OUT)
                        .quantity(-Math.abs(soldQuantity))
                        .referenceId(newOrder.getOrderId())
                        .note("POS Sale - Order " + newOrder.getOrderId())
                        .build();
                inventoryTransactionRepository.saveAndFlush(transaction);

                Integer updatedStock = inventoryTransactionRepository.calculateStockByVariantId(variant.getVariantId());
                variant.setCachedStockQuantity(updatedStock != null ? updatedStock : 0);
                variantRepository.save(variant);
            }
        }

        // Xử lý tạo link PayOS nếu là thanh toán chuyển khoản
        if (newOrder.getPaymentMethod() == PaymentMethod.PAYOS) { 
            try {
                long orderCode = newOrder.getId(); 

                List<PaymentLinkItem> payOSItems = newOrder.getItems().stream() 
                        .map(item -> PaymentLinkItem.builder() 
                                .name(item.getName()) 
                                .price(item.getPrice().longValue()) 
                                .quantity(item.getQuantity()) 
                                .build()) 
                        .collect(Collectors.toList()); 

                CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder() 
                        .orderCode(orderCode) 
                        .amount(newOrder.getGrandTotal().longValue()) 
                        .description("Thanh toan don " + orderCode) 
                        .returnUrl("http://localhost:5173/payment/success") 
                        .cancelUrl("http://localhost:5173/payment/cancel") 
                        .items(payOSItems) 
                        .build(); 

                CreatePaymentLinkResponse payOSResponse = payOS.paymentRequests().create(paymentRequest); 

                // --- ĐOẠN CODE ĐÃ ĐƯỢC CẬP NHẬT: LƯU VÀO DATABASE ---
                newOrder.getPaymentDetails().setPaymentLinkId(payOSResponse.getPaymentLinkId()); 
                newOrder.getPaymentDetails().setCheckoutUrl(payOSResponse.getCheckoutUrl());
                newOrder.getPaymentDetails().setQrCode(payOSResponse.getQrCode());
                newOrder.getPaymentDetails().setOrderId(newOrder.getOrderId());

                // Lưu lại Entity với đầy đủ thông tin link và QR
                orderEntityRepository.save(newOrder); 

            } catch (PayOSException e) { 
                throw new RuntimeException("Lỗi khi tạo mã thanh toán PayOS: " + e.getMessage(), e); 
            } catch (Exception e) { 
                throw new RuntimeException("Lỗi khi tạo mã thanh toán PayOS: " + e.getMessage(), e); 
            }
        }

        return convertToResponse(newOrder);
    }

    private OrderItemEntity convertToOrderItemEntity(OrderRequest.OrderItemRequest orderItemRequest) {
        String modifiersJson = null;
        if (orderItemRequest.getSelectedModifiers() != null && !orderItemRequest.getSelectedModifiers().isEmpty()) {
            try {
                modifiersJson = objectMapper.writeValueAsString(orderItemRequest.getSelectedModifiers());
            } catch (Exception ignored) {
            }
        }

        return OrderItemEntity.builder() 
                .itemId(orderItemRequest.getItemId()) 
                .variantId(orderItemRequest.getVariantId())
                .name(orderItemRequest.getName()) 
                .basePrice(orderItemRequest.getBasePrice() != null ? orderItemRequest.getBasePrice() : orderItemRequest.getPrice())
                .price(orderItemRequest.getPrice()) 
                .quantity(orderItemRequest.getQuantity()) 
                .selectedModifiers(modifiersJson)
                .build(); 
    }

    private OrderResponse convertToResponse(OrderEntity newOrder) {
        return  OrderResponse.builder()
                .orderId(newOrder.getOrderId()) 
                .customerName(newOrder.getCustomerName()) 
                .phoneNumber(newOrder.getPhoneNumber()) 
                .subtotal(newOrder.getSubtotal()) 
                .tax(newOrder.getTax()) 
                .grandTotal(newOrder.getGrandTotal()) 
                .paymentMethod(newOrder.getPaymentMethod()) 
                .items(newOrder.getItems().stream() 
                        .map(this::convertToItemResponse) 
                        .collect(Collectors.toList())) 
                .paymentDetails(newOrder.getPaymentDetails()) 
                .createdAt(newOrder.getCreatedAt()) 
                .build();
    }

    private OrderResponse.OrderItemResponse convertToItemResponse(OrderItemEntity orderItemEntity) {
        List<SelectedModifier> selectedModifiers = new ArrayList<>();
        if (orderItemEntity.getSelectedModifiers() != null && !orderItemEntity.getSelectedModifiers().trim().isEmpty()) {
            try {
                selectedModifiers = objectMapper.readValue(
                        orderItemEntity.getSelectedModifiers(),
                        new TypeReference<List<SelectedModifier>>() {});
            } catch (Exception ignored) {
            }
        }

        return OrderResponse.OrderItemResponse.builder() 
                .itemId(orderItemEntity.getItemId()) 
                .variantId(orderItemEntity.getVariantId())
                .name(orderItemEntity.getName()) 
                .basePrice(orderItemEntity.getBasePrice())
                .price(orderItemEntity.getPrice()) 
                .quantity(orderItemEntity.getQuantity()) 
                .selectedModifiers(selectedModifiers)
                .build(); 
    }

    private OrderEntity convertToOrderEntity(OrderRequest request) {
        return OrderEntity.builder() 
                .customerName(request.getCustomerName()) 
                .phoneNumber(request.getPhoneNumber()) 
                .subtotal(request.getSubtotal()) 
                .tax(request.getTax()) 
                .grandTotal(request.getGrandTotal()) 
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod())) 
                .build(); 
    }

    @Override
    public void deleteOrder(String orderId) {
        OrderEntity existingOrder = orderEntityRepository.findByOrderId(orderId) 
                .orElseThrow(()-> new RuntimeException("Order Not Found")); 
        orderEntityRepository.delete(existingOrder); 
    }

    @Override
    public List<OrderResponse> getLatestOrders() {
        return orderEntityRepository.findAllByOrderByCreatedAtDesc() 
                .stream() 
                .map(this::convertToResponse) 
                .collect(Collectors.toList()); 
    }

    @Override
    public OrderResponse getOrderById(String orderId) {
        OrderEntity existingOrder = orderEntityRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order Not Found"));
        return convertToResponse(existingOrder);
    }

    @Override
    public Double sumSalesByDate(LocalDate date) {
        return orderEntityRepository.sumSalesByDate(date);
    }

    @Override
    public Long countByOrderDate(LocalDate date) {
        return orderEntityRepository.countByOrderDate(date);
    }

    @Override
    public List<OrderResponse> findRecentOrders(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return orderEntityRepository.findRecentOrders(pageable)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}
//package learn.java.billingsoftware.service.impl;
//
//import learn.java.billingsoftware.entity.OrderEntity;
//import learn.java.billingsoftware.entity.OrderItemEntity;
//import learn.java.billingsoftware.io.OrderRequest;
//import learn.java.billingsoftware.io.OrderResponse;
//import learn.java.billingsoftware.io.PaymentDetails;
//import learn.java.billingsoftware.io.PaymentMethod;
//import learn.java.billingsoftware.repository.OrderEntityRepository;
//import learn.java.billingsoftware.service.OrderService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import vn.payos.PayOS;
//import vn.payos.exception.PayOSException;
//import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
//import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
//import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class OrderServiceImpl implements OrderService {
//    private final OrderEntityRepository orderEntityRepository;
//    private final PayOS payOS;
//
//    @Override
//    public OrderResponse createOrder(OrderRequest request) {
//        OrderEntity newOrder = convertToOrderEntity(request);
//
//        PaymentDetails paymentDetails = new PaymentDetails();
//        paymentDetails.setStatus(newOrder.getPaymentMethod() == PaymentMethod.CASH ?
//                PaymentDetails.PaymentStatus.COMPLETED : PaymentDetails.PaymentStatus.PENDING);
//        newOrder.setPaymentDetails(paymentDetails);
//
//        List<OrderItemEntity> orderItems = request.getCartItems().stream()
//                .map(this::convertToOrderItemEntity)
//                .collect(Collectors.toList());
//
//        OrderEntity finalNewOrder = newOrder;
//        orderItems.forEach(item -> item.setOrder(finalNewOrder));
//        newOrder.setItems(orderItems);
//
//        // Lưu lần 1 để lấy ID (dùng làm orderCode cho PayOS)
//        newOrder = orderEntityRepository.save(newOrder);
//
//        String checkoutUrl = null;
//        String qrCode = null;
//
//        // Xử lý tạo link PayOS nếu là thanh toán chuyển khoản
//        // Trong createOrder(...)
//        if (newOrder.getPaymentMethod() == PaymentMethod.PAYOS) {
//            try {
//                long orderCode = newOrder.getId();
//
//                List<PaymentLinkItem> payOSItems = newOrder.getItems().stream()
//                        .map(item -> PaymentLinkItem.builder()
//                                .name(item.getName())
//                                .price(item.getPrice().longValue())
//                                .quantity(item.getQuantity())
//                                .build())
//                        .collect(Collectors.toList());
//
//                CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder()
//                        .orderCode(orderCode)
//                        .amount(newOrder.getGrandTotal().longValue())
//                        .description("Thanh toan don " + orderCode)
//                        .returnUrl("http://localhost:5173/payment/success")
//                        .cancelUrl("http://localhost:5173/payment/cancel")
//                        .items(payOSItems)
//                        .build();
//
//                CreatePaymentLinkResponse payOSResponse = payOS.paymentRequests().create(paymentRequest);
//
//                checkoutUrl = payOSResponse.getCheckoutUrl();
//                qrCode = payOSResponse.getQrCode();
//
//                newOrder.getPaymentDetails().setPaymentLinkId(payOSResponse.getPaymentLinkId());
//                orderEntityRepository.save(newOrder);
//
//
//            } catch (PayOSException e) {
//                throw new RuntimeException("Lỗi khi tạo mã thanh toán PayOS: " + e.getMessage(), e);
//            } catch (Exception e) {
//                throw new RuntimeException("Lỗi khi tạo mã thanh toán PayOS: " + e.getMessage(), e);
//            }
//        }
//
//
//        OrderResponse response = convertToResponse(newOrder);
//        response.setCheckoutUrl(checkoutUrl);
//        response.setQrCode(qrCode);
//
//        return response;
//    }
//
////    @Override
////    public OrderResponse createOrder(OrderRequest request) {
////        OrderEntity newOrder = convertToOrderEntity(request);
////
////        PaymentDetails paymentDetails = new PaymentDetails();
////        paymentDetails.setStatus(newOrder.getPaymentMethod() == PaymentMethod.CASH ?
////                PaymentDetails.PaymentStatus.COMPLETED : PaymentDetails.PaymentStatus.PENDING);
////        newOrder.setPaymentDetails(paymentDetails);
////
////        List<OrderItemEntity> orderItems = request.getCartItems().stream()
////                .map(this::convertToOrderItemEntity)
////                .collect(Collectors.toList());
////
////        OrderEntity finalNewOrder = newOrder;
////        orderItems.forEach(item -> item.setOrder(finalNewOrder));
////
////        newOrder.setItems(orderItems);
////        newOrder = orderEntityRepository.save(newOrder);
////        return convertToResponse(newOrder);
////    }
//
//
//    private OrderItemEntity convertToOrderItemEntity(OrderRequest.OrderItemRequest orderItemRequest) {
//        return OrderItemEntity.builder()
//                .itemId(orderItemRequest.getItemId())
//                .name(orderItemRequest.getName())
//                .price(orderItemRequest.getPrice())
//                .quantity(orderItemRequest.getQuantity())
//                .build();
//    }
//
//    private OrderResponse convertToResponse(OrderEntity newOrder) {
//        return OrderResponse.builder()
//                .orderId(newOrder.getOrderId())
//                .customerName(newOrder.getCustomerName())
//                .phoneNumber(newOrder.getPhoneNumber())
//                .subtotal(newOrder.getSubtotal())
//                .tax(newOrder.getTax())
//                .grandTotal(newOrder.getGrandTotal())
//                .paymentMethod(newOrder.getPaymentMethod())
//                .items(newOrder.getItems().stream()
//                        .map(this::convertToItemResponse)
//                        .collect(Collectors.toList()))
//                .paymentDetails(newOrder.getPaymentDetails())
//                .createdAt(newOrder.getCreatedAt())
//                .build();
//    }
//
//    private OrderResponse.OrderItemResponse convertToItemResponse(OrderItemEntity orderItemEntity) {
//        return OrderResponse.OrderItemResponse.builder()
//                .itemId(orderItemEntity.getItemId())
//                .name(orderItemEntity.getName())
//                .price(orderItemEntity.getPrice())
//                .quantity(orderItemEntity.getQuantity())
//                .build();
//    }
//
//    private OrderEntity convertToOrderEntity(OrderRequest request) {
//        return OrderEntity.builder()
//                .customerName(request.getCustomerName())
//                .phoneNumber(request.getPhoneNumber())
//                .subtotal(request.getSubtotal())
//                .tax(request.getTax())
//                .grandTotal(request.getGrandTotal())
//                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()))
//                .build();
//    }
//
//    @Override
//    public void deleteOrder(String orderId) {
//        OrderEntity existingOrder = orderEntityRepository.findByOrderId(orderId)
//                .orElseThrow(()-> new RuntimeException("Order Not Found"));
//        orderEntityRepository.delete(existingOrder);
//    }
//
//    @Override
//    public List<OrderResponse> getLatestOrders() {
//        return orderEntityRepository.findAllByOrderByCreatedAtDesc()
//                .stream()
//                .map(this::convertToResponse)
//                .collect(Collectors.toList());
//    }
//}