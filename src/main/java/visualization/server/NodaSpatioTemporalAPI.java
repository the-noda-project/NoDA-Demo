package visualization.server;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static visualization.visualization.Visualize.stDataToVisualize;

@RestController
public class NodaSpatioTemporalAPI {

    @RequestMapping(value = "/noda-st-timelapse", produces = "text/plain")
    public String connectionMessage() {

        return stDataToVisualize.toString();
    }

}
