package ie.ittralee.domain;

/**
 * Created by Michael on 11/17/2015.
 */
import java.io.Serializable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

@Table(name = "makes")
public class Make implements Serializable{

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long Id;

    @NotNull
    private String make;

    public Long getId() {
        return Id;
    }
    public void setId(Long id) {
        Id = id;
    }
    public String getMake() {
        return make;
    }
    public void setMake(String make) {
        this.make = make;
    }
}
