package ie.ittralee.repository;

import ie.ittralee.domain.Car;
import ie.ittralee.domain.User;
import org.springframework.data.repository.CrudRepository;

/**
 *
 * Created by Michael on 1/30/2016.
 */

public interface CarRepository extends CrudRepository<Car, Long> {
    Car findByUser(User user);
}
