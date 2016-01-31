package ie.ittralee.repository;

import ie.ittralee.domain.PassengerJourney;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

/**
 *
 * Created by Michael on 1/25/2016.
 */
public interface PassengerJourneyRepository extends PagingAndSortingRepository<PassengerJourney, Long> {
    public Page<PassengerJourney> findAll(Pageable pageable);
    Page<PassengerJourney> findAllByUserId(Long id, Pageable page);
}
