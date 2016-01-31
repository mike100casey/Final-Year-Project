package ie.ittralee.domain;


import java.io.Serializable;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/**
 *
 * Created by Michael on 1/30/2016.
 */

@SuppressWarnings("serial")
@Entity
@Table(name = "cars")
public class Car implements Serializable{

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="userId", nullable=false, updatable=false)
    private User user;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="makeAndModelId", nullable=false)
    private MakeAndModel makeAndModel;

    private int year;


    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public MakeAndModel getMakeAndModel() {
        return makeAndModel;
    }
    public void setMakeAndModel(MakeAndModel makeAndModel) {
        this.makeAndModel = makeAndModel;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public int getYear() {
        return year;
    }
    public void setYear(int year) {
        this.year = year;
    }

}
