package ie.ittralee.web.rest;


import ie.ittralee.service.JourneyService;
import ie.ittralee.web.rest.dto.PassengerJourneyDTO;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

import ie.ittralee.web.rest.util.Utils;

/**
 *
 * Created by Michael on 1/25/2016.
 */

@RestController
@RequestMapping("/api/journey")
public class JourneyController {

    @Autowired
    JourneyService journeyService;

    @SuppressWarnings("unchecked")
    @RequestMapping(value="/registerPassengerJourney",method= RequestMethod.POST)
    @PreAuthorize("permitAll")
    public @ResponseBody
    JSONObject registerJourneyRequest(@RequestBody @Valid PassengerJourneyDTO dto, BindingResult result) {
        List<String> errors = journeyService.validatePassengerJourney(dto, result);
        if(errors.isEmpty()){
            journeyService.createPassengerRequest(dto);
            return Utils.returnSuccess();
        }
        else{
            return Utils.returnErrors(errors);
        }
    }

    @RequestMapping(value = "/allJourneyRequests", method = RequestMethod.GET)
    Page<PassengerJourneyDTO> findAllJourneyRequests(Pageable page) {
        return journeyService.getAllJourneyRequests(page);
    }


}
