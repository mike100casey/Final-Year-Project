package ie.ittralee.domain;

import javax.persistence.*;

/***
 * Created by Michael on 4/4/2016.
 */

@SuppressWarnings("serial")
@Entity
@Table(name = "Waypoints")
public class Waypoints {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    private Long journeyId;

    public Long getJourneyId() {  return journeyId;  }

    public void setJourneyId(Long journeyId) {  this.journeyId = journeyId;  }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


}
