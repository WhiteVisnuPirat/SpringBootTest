package ru.kata.spring.boot_security.demo.model;

import org.springframework.security.core.GrantedAuthority;

import javax.annotation.processing.Generated;
import javax.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "roles")
public class Role implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long ig;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    public Role(){}

    public Role(String name){
        this.name = name;
    }

    public long getIg() {
        return ig;
    }

    public void setIg(long ig) {
        this.ig = ig;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String getAuthority() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return ig == role.ig && Objects.equals(name, role.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ig, name);
    }

    @Override
    public String toString() {
        return "Role{" +
                "ig=" + ig +
                ", name='" + name + '\'' +
                '}';
    }
}

