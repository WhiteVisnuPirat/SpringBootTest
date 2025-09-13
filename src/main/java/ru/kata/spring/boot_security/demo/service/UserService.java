package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.User;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(Long id);
    User getUserByUsername(String username);
    User saveUser(User user);
    User saveUserWithRoles(User user, List<Long> roleIds); // Новый метод
    User updateUser(User user);
    User updateUserWithRoles(User user, List<Long> roleIds); // Новый метод
    void deleteUser(Long id);
}