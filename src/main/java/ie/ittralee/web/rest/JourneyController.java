package ie.ittralee.web.rest;

import ie.ittralee.service.JourneyService;
import ie.ittralee.web.rest.dto.PassengerJourneyDTO;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 *
 * Created by Michael on 1/25/2016.
 */

@RestController
@RequestMapping("/api/journey")
public class JourneyController {

    @Autowired
    JourneyService journeyService;

    @RequestMapping(value="/registerPassengerJourney",method= RequestMethod.POST)
    public @ResponseBody
    JSONObject registerJourneyRequest(@RequestBody @Valid PassengerJourneyDTO dto, BindingResult result) {
        List<String> errors = journeyService.validatePassengerJourney(dto, result);
        if(errors.isEmpty()){
            journeyService.createPassengerRequest(dto);
            return JourneyController.returnSuccess();
        }
        else{
            return JourneyController.returnErrors(errors);
        }
    }

    @SuppressWarnings({ "unchecked" })
    public static JSONObject returnSuccess() {
        JSONObject json = new JSONObject();
        json.put("Status","SUCCESS");
        json.put("Body", "OK");
        return json;
    }

    @SuppressWarnings({ "unchecked" })
    public static JSONObject returnErrors(List<String> errors) {
        JSONObject json = new JSONObject();
        json.put("Status","FAIL");
        json.put("Body",errors);
        return json;
    }
}
