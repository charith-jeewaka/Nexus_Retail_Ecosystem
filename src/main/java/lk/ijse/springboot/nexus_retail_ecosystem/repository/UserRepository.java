package lk.ijse.springboot.nexus_retail_ecosystem.repository;

import lk.ijse.springboot.nexus_retail_ecosystem.entity.User;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByRole(Role role); // To check if an Admin already exists
}