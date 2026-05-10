package lk.ijse.springboot.nexus_retail_ecosystem.repository;

import lk.ijse.springboot.nexus_retail_ecosystem.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail,Long> {
    List<OrderDetail> findByOrder_Id(Long orderId);

    @Query("SELECT COALESCE(SUM(od.quantity), 0) FROM OrderDetail od WHERE od.product.id = :productId AND od.order.status IN ('PROCESSING', 'COMPLETED')")
    Integer getTotalSoldQuantityByProductId(@Param("productId") Long productId);


}
