package ie.ittralee.web.rest.util;

import ie.ittralee.domain.DriverJourney;
import ie.ittralee.domain.PassengerJourney;
import ie.ittralee.web.rest.dto.DriverJourneyDTO;
import ie.ittralee.web.rest.dto.PassengerJourneyDTO;
import org.json.simple.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * Created by Michael on 1/30/2016.
 */
public class Utils {

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

    public static List<PassengerJourneyDTO> convertToJourneyRequestPage(List<PassengerJourney> content) {
        List<PassengerJourneyDTO> dtos = new ArrayList<>();
        for(PassengerJourney journey: content){
            dtos.add(journey.toDTO());
        }
        return dtos;
    }

    public static List<DriverJourneyDTO> convertToJourneyPage(List<DriverJourney> content) {
        List<DriverJourneyDTO> dtos = new ArrayList<>();
        for(DriverJourney journeyRequest: content){
            dtos.add(journeyRequest.toDTO());
        }
        return dtos;
    }
}
