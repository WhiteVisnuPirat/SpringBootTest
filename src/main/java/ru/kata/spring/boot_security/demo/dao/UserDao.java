package ru.kata.spring.boot_security.demo.dao;

import ru.kata.spring.boot_security.demo.model.User;
import java.util.List;

public interface UserDao {
    List<User> findAll();
    User findById(Long id);
    User findByUsername(String username);
    void save(User user); // Оставляем void, так как persist не возвращает объект
    void update(User user); // Оставляем void
    void delete(Long id);
}