package ie.ittralee.repository;

/**
 * Created by Michael on 11/17/2015.
 */
import org.springframework.data.repository.CrudRepository;

import ie.ittralee.domain.Make;

public interface MakesRepository extends CrudRepository<Make, Long>{
    Make findByMake(String make);
}
