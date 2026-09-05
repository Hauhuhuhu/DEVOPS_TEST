package learn.java.billingsoftware.controller;

import learn.java.billingsoftware.io.InventoryTransactionRequest;
import learn.java.billingsoftware.io.InventoryTransactionResponse;
import learn.java.billingsoftware.io.StockCheckRequest;
import learn.java.billingsoftware.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/admin/inventory/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryTransactionResponse recordTransaction(@RequestBody InventoryTransactionRequest request) {
        return inventoryService.recordTransaction(request);
    }

    @PostMapping("/admin/inventory/stock-check")
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryTransactionResponse performStockCheck(@RequestBody StockCheckRequest request) {
        return inventoryService.performStockCheck(request);
    }

    @GetMapping("/admin/inventory/transactions")
    public List<InventoryTransactionResponse> getAllTransactions() {
        return inventoryService.getAllTransactions();
    }

    @GetMapping("/inventory/variants/{variantId}/transactions")
    public List<InventoryTransactionResponse> getVariantTransactions(@PathVariable("variantId") String variantId) {
        return inventoryService.getTransactionsByVariant(variantId);
    }
}
