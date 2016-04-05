package ie.ittralee.web.rest.dto;

import ie.ittralee.domain.DriverJourney;
import ie.ittralee.domain.User;
import ie.ittralee.domain.Waypoints;
import org.hibernate.validator.constraints.NotBlank;

import javax.validation.constraints.Digits;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/***
 * Created by Michael on 4/3/2016.
 */
public class DriverJourneyDTO {

    private Long id;

    @NotNull
    private String userName;

    @NotNull(message = "Source is compulsory")
    @NotBlank(message = "Source is compulsory")
    private String source;

    @NotNull(message = "Destination is compulsory")
    @NotBlank(message = "Destination is compulsory")
    private String destination;

    @NotNull(message = "date is compulsory")
    @NotBlank(message = "date is compulsory")
    private String date;

    @NotNull(message = "Date is compulsory")
    @NotBlank(message = "Date is compulsory")
    private String time;

    private List<Waypoints> waypts;

    public List<Waypoints> getWaypts() {
        return new ArrayList<>(waypts);
    }

    public void setWaypts(List<Waypoints> waypts) {
        this.waypts = new ArrayList<>(waypts);
    }

    public String getUsername() {
        return userName;
    }
    public void setUsername(String username) {
        this.userName = username;
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
    public String getDate() {
        return date;
    }
    public void setDate(String date) {
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

    public DriverJourney toEntity(User user){
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        DriverJourney journey = new DriverJourney();
        journey.setUser(user);
        journey.setSource(this.getSource());
        journey.setDestination(this.getDestination());
        journey.setTime(this.time);
        journey.setWaypts(this.getWaypts());
        try {
            journey.setDate(formatter.parse(this.getDate()));
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return journey;
    }

}
