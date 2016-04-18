package ie.ittralee.service;

import ie.ittralee.domain.DriverJourney;
import ie.ittralee.domain.PassengerJourney;
import ie.ittralee.domain.User;
import ie.ittralee.repository.DriverJourneyRepository;
import ie.ittralee.repository.PassengerJourneyRepository;
import ie.ittralee.repository.UserRepository;
import ie.ittralee.repository.WaypointsRepository;
import ie.ittralee.web.rest.dto.DriverJourneyDTO;
import ie.ittralee.web.rest.dto.PassengerJourneyDTO;
import ie.ittralee.web.rest.util.Utils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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

    @Inject
    DriverJourneyRepository driverJourneyRepository;

    @Inject
    WaypointsRepository waypointsRepository;

    SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");

    public void createPassengerRequest(PassengerJourneyDTO journeyRequestDto) {
        PassengerJourney journeyRequest = journeyRequestDto.toEntity(userRepository.findByLogin(journeyRequestDto.getUsername()));
        passengerJourneyRepository.save(journeyRequest);
    }

    public Page<PassengerJourneyDTO> getAllJourneyRequests(Pageable page) {
        Page<PassengerJourney> journeyRequests = passengerJourneyRepository.findAll(page);
        return new PageImpl<>(Utils.convertToJourneyRequestPage(journeyRequests.getContent()), page, journeyRequests.getTotalElements());
    }

    public List<String> validatePassengerJourney(PassengerJourneyDTO dto, BindingResult result) {
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

    public void createJourney(DriverJourneyDTO journeyDto) {
        DriverJourney journey = journeyDto.toEntity(userRepository.findByLogin(journeyDto.getUsername()));
        waypointsRepository.save(journey.getWaypts());
        driverJourneyRepository.save(journey);
    }

    public void updatePassengerRequest(Long id) {
        PassengerJourney journey = passengerJourneyRepository.findOneById(id);
        journey.setAvailable("no");
        passengerJourneyRepository.save(journey);
    }

    public List<String> validateDriverJourney(DriverJourneyDTO dto, BindingResult result) {
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

    public Page<PassengerJourneyDTO> getPassengerJourneySearchResults(PassengerJourneyDTO passengerJourneyDto, Pageable page) {
        Page<PassengerJourney> passengerJourney = getPassengerJourneyQuery(passengerJourneyDto, page);
        //Page<PassengerJourneyDTO> journeyDtos = new PageImpl<>(Utils.convertToJourneyRequestPage(passengerJourney.getContent()), page, passengerJourney.getTotalElements());
        return new PageImpl<>(Utils.convertToJourneyRequestPage(passengerJourney.getContent()), page, passengerJourney.getTotalElements());
        //return journeyDtos;
    }

    private Page<PassengerJourney> getPassengerJourneyQuery(PassengerJourneyDTO passengerJourneyDto, Pageable page) {
        String available = "yes";
        Date date = null;
        try {
            date = formatter.parse(passengerJourneyDto.getDate());
        } catch (ParseException e) {
           e.printStackTrace();
        }

        Page<PassengerJourney> journeyRequests = null;
        journeyRequests = passengerJourneyRepository.findAllRecent(page, date, available);
        return journeyRequests;
    }

    public Page<DriverJourneyDTO> getAllUserJourneys(String username, Pageable page) {
        Page<DriverJourney> journeys = driverJourneyRepository.findAllByUserId(userRepository.findByLogin(username).getId(), page);
        return new PageImpl<>(Utils.convertToJourneyPage(journeys.getContent()), page, journeys.getTotalElements());
    }

    public Page<PassengerJourneyDTO> getAllUserPassengerJourneys(String username, Pageable page) {
        Page<PassengerJourney> journeys = passengerJourneyRepository.findAllByUserId(userRepository.findByLogin(username).getId(), page);
        return new PageImpl<>(Utils.convertToJourneyRequestPage(journeys.getContent()), page, journeys.getTotalElements());
    }
}
