package doHoaSen.SpeedNews.auth.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "role") @Getter @Setter
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private  Long id;
    @Column(nullable = false, unique = true) private String name;
}
