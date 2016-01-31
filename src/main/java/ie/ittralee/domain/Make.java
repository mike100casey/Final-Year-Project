package ie.ittralee.domain;

/**
 *
 * Created by Michael on 11/17/2015.
 */

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;

@SuppressWarnings("serial")
@Entity
@Table(name = "makes")
public class Make implements Serializable{

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    @NotNull
    private String make;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        id = id;
    }
    public String getMake() {
        return make;
    }
    public void setMake(String make) {
        this.make = make;
    }
}
