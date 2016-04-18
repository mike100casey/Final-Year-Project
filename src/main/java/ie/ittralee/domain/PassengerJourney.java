package ie.ittralee.domain;

import ie.ittralee.web.rest.dto.PassengerJourneyDTO;

import javax.persistence.*;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 *
 * Created by Michael on 1/25/2016.
 */

@SuppressWarnings("serial")
@Entity
@Table(name = "Passenger_Journey")
public class PassengerJourney {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="user_Id", nullable=false, updatable=false)
    private User user;

    private String source;
    private String destination;
    private Date date;
    private String time;
    private String available;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAvailable() { return available;  }

    public void setAvailable(String available) { this.available = available; }

    public PassengerJourneyDTO toDTO() {
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        PassengerJourneyDTO dto = new PassengerJourneyDTO();
        dto.setId(this.getId());
        dto.setUsername(this.getUser().getLogin());
        dto.setSource(this.getSource());
        dto.setDestination(this.getDestination());
        dto.setDate(formatter.format(this.getDate()));
        dto.setTime(this.getTime());
        dto.setAvailable(this.getAvailable());
        return dto;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
