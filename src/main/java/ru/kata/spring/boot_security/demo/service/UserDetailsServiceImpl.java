package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.dao.UserDao;
import ru.kata.spring.boot_security.demo.model.User;

@Service("userDetailsService")
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserDao userDao;

    public UserDetailsServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("=== DEBUG: Searching for user: '" + username + "' ===");

        User user = userDao.findByUsername(username);

        if (user == null) {
            System.out.println("=== DEBUG: User NOT FOUND: '" + username + "' ===");
            throw new UsernameNotFoundException("User not found: " + username);
        }

        System.out.println("=== DEBUG: User FOUND: " + user.getUsername() + " ===");
        System.out.println("=== DEBUG: Password hash: " + user.getPassword() + " ===");
        System.out.println("=== DEBUG: Roles: " + user.getRoles() + " ===");

        return user;
    }
}