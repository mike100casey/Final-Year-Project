package ie.ittralee.domain;

import ie.ittralee.web.rest.dto.DriverJourneyDTO;

import javax.persistence.*;
import java.text.SimpleDateFormat;
import java.util.Date;
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
    private String waypoints1;
    private String waypoints2;

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

    public String getWaypoints1() {
        return waypoints1;
    }

    public void setWaypoints1(String waypoints1) {
        this.waypoints1 = waypoints1;
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
        driverJourneyDto.setWaypoints1(this.getWaypoints1());
        driverJourneyDto.setWaypoints1(this.getWaypoints1());
        driverJourneyDto.setWaypoints2(this.getWaypoints2());
        driverJourneyDto.setWaypoints2(this.getWaypoints2());
        return driverJourneyDto;
    }


    public String getWaypoints2() {
        return waypoints2;
    }

    public void setWaypoints2(String waypoints2) {
        this.waypoints2 = waypoints2;
    }
}
