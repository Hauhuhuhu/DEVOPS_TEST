package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboarResponse {
    private Double todaySales;
    private Long todayOrderCount;
    private List<OrderResponse> recentOrders;
}
