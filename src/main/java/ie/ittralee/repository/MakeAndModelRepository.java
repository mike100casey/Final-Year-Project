package ie.ittralee.repository;

/**
 * Created by Michael on 11/17/2015.
 */

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import ie.ittralee.domain.MakeAndModel;

public interface MakeAndModelRepository extends CrudRepository<MakeAndModel, Long>{

    List<MakeAndModel> findByMakeId(Long makeId);
    MakeAndModel findByMakeIdAndModel(Long makeId, String model);
}
