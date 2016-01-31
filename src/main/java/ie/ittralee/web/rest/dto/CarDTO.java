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
    private String userName;

    @NotNull
    private Long makeAndModel;

    @NotNull
    @Min(value = 1920)
    @Max(value = 2100)
    private int year;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getMakeAndModel() {
        return makeAndModel;
    }

    public void setMakeAndModel(Long makeAndModel) {
        this.makeAndModel = makeAndModel;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }
}
