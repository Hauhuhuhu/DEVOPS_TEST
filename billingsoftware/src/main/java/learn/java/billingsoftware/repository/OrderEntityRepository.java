package learn.java.billingsoftware.repository;

import learn.java.billingsoftware.entity.OrderEntity;
import learn.java.billingsoftware.io.PaymentDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrderEntityRepository extends JpaRepository<OrderEntity, Long> {
    Optional<OrderEntity>findByOrderId(String orderId);

    List<OrderEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT SUM(o.grandTotal) FROM OrderEntity o WHERE DATE(o.createdAt) = :date")
    Double sumSalesByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE DATE(o.createdAt) = :date")
    Long countByOrderDate(@Param("date") LocalDate date);

    @Query("SELECT o FROM OrderEntity o order by o.createdAt DESC")
    List<OrderEntity> findRecentOrders(Pageable pageable);

    @Query(value = "SELECT o FROM OrderEntity o WHERE " +
            "(:status IS NULL OR o.paymentDetails.status = :status) AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "o.phoneNumber LIKE CONCAT('%', :search, '%'))",
            countQuery = "SELECT COUNT(o) FROM OrderEntity o WHERE " +
            "(:status IS NULL OR o.paymentDetails.status = :status) AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "o.phoneNumber LIKE CONCAT('%', :search, '%'))")
    Page<OrderEntity> findOrdersWithFilter(@Param("search") String search,
                                          @Param("status") PaymentDetails.PaymentStatus status,
                                          Pageable pageable);
}
