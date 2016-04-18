package ie.ittralee.repository;

import ie.ittralee.domain.PassengerJourney;
import ie.ittralee.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 *
 * Created by Michael on 1/25/2016.
 */
public interface PassengerJourneyRepository extends PagingAndSortingRepository<PassengerJourney, Long> {

    Page<PassengerJourney> findAll(Pageable pageable);
    Page<PassengerJourney> findAllByUserId(Long id, Pageable page);

    @Query("SELECT j FROM PassengerJourney j WHERE j.date LIKE :date AND j.available LIKE :available")
    Page<PassengerJourney> findAllRecent(Pageable page, @Param("date") Date date, @Param("available") String available);

    PassengerJourney findOneById(Long id);

}

