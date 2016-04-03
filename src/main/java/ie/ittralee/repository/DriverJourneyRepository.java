package ie.ittralee.repository;

import ie.ittralee.domain.DriverJourney;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/***
 * Created by Michael on 4/3/2016.
 */
public interface DriverJourneyRepository extends JpaRepository<DriverJourney, Long> {

    public Page<DriverJourney> findAll(Pageable pageable);
    Page<DriverJourney> findAllByUserId(Long userId, Pageable pageable);
}
