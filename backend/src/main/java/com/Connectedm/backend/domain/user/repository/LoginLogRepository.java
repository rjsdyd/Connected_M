package com.Connectedm.backend.domain.user.repository;

import com.Connectedm.backend.domain.user.entity.LoginLog;
import com.Connectedm.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
    List<LoginLog> findByUserOrderByLoginAtDesc(User userId);

    List<LoginLog> findAllByOrderByLoginAt();

}
