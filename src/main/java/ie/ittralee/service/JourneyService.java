package ie.ittralee.service;

import ie.ittralee.domain.PassengerJourney;
import ie.ittralee.repository.PassengerJourneyRepository;
import ie.ittralee.repository.UserRepository;
import ie.ittralee.web.rest.dto.PassengerJourneyDTO;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import javax.inject.Inject;
import javax.transaction.Transactional;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;



/**
 *
 * Created by Michael on 1/25/2016.
 */

@Service
@Transactional
public class JourneyService {

    @Inject
    UserRepository userRepository;

    @Inject
    PassengerJourneyRepository passengerJourneyRepository;

    SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");

    public void createPassengerRequest(PassengerJourneyDTO journeyRequestDto) {
        PassengerJourney journeyRequest = journeyRequestDto.toEntity(userRepository.findByLogin(journeyRequestDto.getUsername()));
        passengerJourneyRepository.save(journeyRequest);
    }

    public List<String> validatePassengerJourney(
        PassengerJourneyDTO dto, BindingResult result) {
        Date journeyDate = null;
        try {
            journeyDate = formatter.parse(dto.getDate());
            if (journeyDate.before(new Date())) {
                result.rejectValue("date", "error.user", "Date must be in the future!!");
            }
        } catch (ParseException e) {
            result.rejectValue("date", "error.user", "An error occurred with the date you picked!!!");
        }

        List<String> errorMessages = new LinkedList<String>();
        if (result.hasErrors()) {

            List<FieldError> errors = result.getFieldErrors();
            for (FieldError error : errors) {
                errorMessages.add(error.getDefaultMessage());
            }
        }
        return errorMessages;
    }

}
