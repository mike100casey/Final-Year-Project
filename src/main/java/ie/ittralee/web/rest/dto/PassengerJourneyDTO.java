package ie.ittralee.web.rest.dto;

import ie.ittralee.domain.PassengerJourney;
import ie.ittralee.domain.User;
import org.hibernate.validator.constraints.NotBlank;

import javax.validation.constraints.NotNull;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 *
 * Created by Michael on 1/25/2016.
 */
public class PassengerJourneyDTO {

    private Long id;

    @NotNull
    private String username;

    @NotNull(message = "Source is compulsory")
    @NotBlank(message = "Source is compulsory")
    private String source;

    @NotNull(message = "destination is compulsory")
    @NotBlank(message = "destination is compulsory")
    private String destination;

    @NotNull(message = "date is compulsory")
    @NotBlank(message = "date is compulsory")
    private String date;

    @NotNull(message = "time is compulsory")
    @NotBlank(message = "time is compulsory")
    private String time;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public PassengerJourney toEntity(User user){
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        PassengerJourney passengerJourney = new PassengerJourney();
        passengerJourney.setUser(user);
        passengerJourney.setSource(this.getSource());
        passengerJourney.setDestination(this.getDestination());
        try {
            passengerJourney
                .setDate(formatter.parse(this.getDate()));
        } catch (ParseException e) {
            e.printStackTrace();
        }
        passengerJourney.setTime(this.getTime());
        return passengerJourney;
    }
}
