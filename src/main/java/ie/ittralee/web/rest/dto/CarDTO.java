package ie.ittralee.web.rest.dto;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

/**
 *
 * Created by Michael on 1/30/2016.
 */

public class CarDTO {

    @NotNull
    private String username;

    @NotNull
    private Long makeandmodel;

    @NotNull
    @Min(value = 1920)
    @Max(value = 2100)
    private int year;

    public String getUserName() {
        return username;
    }

    public void setUserName(String username) {
        this.username = username;
    }

    public Long getMakeAndModel() {
        return makeandmodel;
    }

    public void setMakeAndModel(Long makeandmodel) {
        this.makeandmodel = makeandmodel;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }
}
