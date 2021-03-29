package visualization.server;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static visualization.visualization.Visualize.spatialDataToVisualize;

@RestController
public class NodaSpatialAPI {

    @RequestMapping(value = "/noda-spatial", produces = "text/plain")
    public String connectionMessage() {

        return spatialDataToVisualize.toString();
    }

}

