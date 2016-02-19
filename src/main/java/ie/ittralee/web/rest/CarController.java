package ie.ittralee.web.rest;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import ie.ittralee.service.CarService;
import ie.ittralee.web.rest.dto.CarDTO;
import ie.ittralee.web.rest.util.Utils;

import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

/**
 *
 * Created by Michael on 1/30/2016. @Autowired
 */

@RestController
@RequestMapping("/api/car")
public class CarController {

    @Autowired
    CarService carService;

    @SuppressWarnings("unchecked")
    @RequestMapping(value="/registration",method=RequestMethod.POST)
    @PreAuthorize("permitAll")
    public @ResponseBody JSONObject processRegistrationCar(@RequestBody CarDTO carDto, BindingResult result) {
        List<String> errors = carService.validateCar(result);
        if(!result.hasErrors()){
            carService.createCar(carDto);
            return Utils.returnSuccess();
        }
        else{
            return Utils.returnErrors(errors);
        }
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/getUserCar/{username}", method = RequestMethod.GET)
    @ResponseBody JSONObject findCar(@PathVariable("username") String username, HttpServletResponse response) {
        JSONObject car = new JSONObject();
        List<Object> carDetails = carService.getCar(username);
        car.put("make", carDetails.get(0));
        car.put("model", carDetails.get(1));
        car.put("year", carDetails.get(2));
        return car;
    }

    @RequestMapping(value = "/updateCar/{username}", method = RequestMethod.POST)
    @ResponseStatus(value = HttpStatus.OK)
    public void updateCar(@RequestBody CarDTO carDto, BindingResult result, @PathVariable("username") String username) {
        carService.updateCar(carDto, username);
    }
}
