package ie.ittralee.web.rest.util;

import org.json.simple.JSONObject;

import java.util.List;

/**
 *
 * Created by Michael on 1/30/2016.
 */
public class Utils {

    @SuppressWarnings({ "unchecked" })
    public static JSONObject returnSuccess() {
        JSONObject json = new JSONObject();
        json.put("Status","SUCCESS");
        json.put("Body", "OK");
        return json;
    }

    @SuppressWarnings({ "unchecked" })
    public static JSONObject returnErrors(List<String> errors) {
        JSONObject json = new JSONObject();
        json.put("Status","FAIL");
        json.put("Body",errors);
        return json;
    }
}
