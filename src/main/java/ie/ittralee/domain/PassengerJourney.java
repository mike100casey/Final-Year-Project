package ie.ittralee.domain;

import ie.ittralee.web.rest.dto.PassengerJourneyDTO;

import javax.persistence.*;
import java.io.Serializable;
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
    private double sourceLat;
    private double sourceLng;

    private String destination;
    private double destinationLat;
    private double destinationLng;

    private Date date;

    private String time;

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

    public double getSourceLat() {
        return sourceLat;
    }

    public void setSourceLat(double sourceLat) {
        this.sourceLat = sourceLat;
    }

    public double getSourceLng() {
        return sourceLng;
    }

    public void setSourceLng(double sourceLng) {
        this.sourceLng = sourceLng;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public double getDestinationLat() {
        return destinationLat;
    }

    public void setDestinationLat(double destinationLat) {
        this.destinationLat = destinationLat;
    }

    public double getDestinationLng() {
        return destinationLng;
    }

    public void setDestinationLng(double destinationLng) {
        this.destinationLng = destinationLng;
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

    public PassengerJourneyDTO toDTO() {
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        PassengerJourneyDTO dto = new PassengerJourneyDTO();
        dto.setId(this.getId());
        dto.setUsername(this.getUser().getLogin());
        dto.setSource(this.getSource());
        dto.setSourceLat(this.getSourceLat());
        dto.setSourceLng(this.getSourceLng());
        dto.setDestination(this.getDestination());
        dto.setDestinationLat(this.getDestinationLat());
        dto.setDestinationLng(this.getDestinationLng());
        dto.setDate(formatter.format(this.getDate()));
        dto.setTime(this.getTime());
        return dto;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
