package ie.ittralee.domain;

import ie.ittralee.web.rest.dto.DriverJourneyDTO;

import javax.persistence.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;

/***
 * Created by Michael on 4/3/2016.
 */

@SuppressWarnings("serial")
@Entity
@Table(name = "Driver_Journey")
public class DriverJourney {

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

    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "journeyId")
    private List<Waypoints> waypts;

    public List<Waypoints> getWaypts() {
        return new ArrayList<>(waypts);
    }

    public void setWaypts(List<Waypoints> waypts) {
        this.waypts = new ArrayList<>(waypts);
    }

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

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }


    public DriverJourneyDTO toDTO() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        DriverJourneyDTO driverJourneyDto = new DriverJourneyDTO();
        driverJourneyDto.setId(this.getId());
        driverJourneyDto.setUsername(this.getUser().getLogin());
        driverJourneyDto.setSource(this.getSource());
        driverJourneyDto.setDestination(this.getDestination());
        driverJourneyDto.setDate(formatter.format(this.getDate()));
        driverJourneyDto.setTime(this.getTime());
        driverJourneyDto.setWaypts(this.getWaypts());
        return driverJourneyDto;
    }

}
