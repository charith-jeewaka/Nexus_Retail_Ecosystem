package lk.ijse.springboot.nexus_retail_ecosystem.repository;

import lk.ijse.springboot.nexus_retail_ecosystem.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail,Long> {
    List<OrderDetail> findByOrder_Id(Long orderId);
}
