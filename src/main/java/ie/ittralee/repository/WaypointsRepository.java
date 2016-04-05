package ie.ittralee.repository;

import ie.ittralee.domain.Waypoints;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/***
 * Created by Michael on 4/4/2016.
 */
public interface WaypointsRepository extends JpaRepository<Waypoints, Long> {

    List<Waypoints> findAllByJourneyId(Long journeyId);
}
