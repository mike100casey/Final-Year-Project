package ie.ittralee.web.rest;

/**
 * Created by Michael on 11/17/2015.
 */

import ie.ittralee.domain.Make;
import ie.ittralee.domain.MakeAndModel;
import ie.ittralee.repository.MakeAndModelRepository;
import ie.ittralee.repository.MakesRepository;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.util.List;


@Controller
@RequestMapping("/api/dropdown")
public class MakeModelController {

    @Autowired
    MakeAndModelRepository makeAndModelRepository;
    @Autowired
    MakesRepository makesRepository;

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/makes", method = RequestMethod.GET)
    @PreAuthorize("permitAll")
    public
    @ResponseBody
    JSONObject sendMakes(HttpServletResponse response) {
        JSONObject makesAsJson = new JSONObject();
        Iterable<Make> list = makesRepository.findAll();
        makesAsJson.put("makes", list);
        return makesAsJson;
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/models/{makeId}", method = RequestMethod.GET)
    @PreAuthorize("permitAll")
    public
    @ResponseBody
    JSONObject sendModels(@PathVariable("makeId") Long Id, HttpServletResponse response) {
        JSONObject makeAndModelAsJson = new JSONObject();
        List<MakeAndModel> makeAndModelsList = makeAndModelRepository.findByMakeId(Id);
        makeAndModelAsJson.put("MakeAndModel", makeAndModelsList);
        return makeAndModelAsJson;
    }

}
