package visualization.server;
import gr.ds.unipi.noda.api.client.NoSqlDbSystem;
import org.apache.spark.sql.SparkSession;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

import static visualization.visualization.Visualize.dbSystem;


    @RestController
    public class APIforDBConnection {

//        static Dataset<Row> spatialDataset;

        @RequestMapping(value = "/db-connection", method = RequestMethod.POST)
        @ResponseBody
        public String spatialSQLQueryPost(@RequestBody Map<String, String> json) throws Exception {
            System.out.println(json.get("db") + " /// " + json.get("dbName") + " /// " +json.get("url")  + " /// " +json.get("port") + " /// " + json.get("username") + " /// " + json.get("password") );


            String db = json.get("db");
            String dbName = json.get("dbName");
            String url = json.get("url");
            Integer port = Integer.parseInt(json.get("port"));
            String username = json.get("username");
            String password = json.get("password");

            if(db == "mongodb") {

                dbSystem.closeConnection();

                SparkSession spark = SparkSession
                        .builder()
                        .appName("Application Name").master("local")
                        .config("spark.mongodb.input.uri", "mongodb://"+ username +":"+ password +"@"+ url +":"+ port +"/"+ dbName)
                        .getOrCreate();

                dbSystem = NoSqlDbSystem.MongoDB().Builder(username,password,dbName).host(url).port(port).sparkSession(spark).build();
                //nikos //12345 //admin //127.0.0.1 //27017
            }
            if(db == "hbase") {

                dbSystem.closeConnection();

                SparkSession spark = SparkSession
                        .builder()
                        .appName("Application Name").master("local")
                        .getOrCreate();

                dbSystem = NoSqlDbSystem.HBase().Builder().port(port).sparkSession(spark).build();
                //2181
            }
            if(db == "neo4j") {

                dbSystem.closeConnection();

                SparkSession spark = SparkSession
                        .builder()
                        .appName("Application Name").master("local")
                        .config("spark.neo4j.user", username)
                        .config("spark.neo4j.password", password)
                        .config("spark.neo4j.url","bolt://"+ url +":" + port)
                        .getOrCreate();

                dbSystem = NoSqlDbSystem.Neo4j().Builder(username, password).host(url).port(port).sparkSession(spark).build();
                //neo4j //nikos //localhost //7687
            }
            if(db == "redis") {

                dbSystem.closeConnection();

                SparkSession spark = SparkSession
                        .builder()
                        .appName("redis-df")
                        .master("local[*]")
                        .config("spark.redis.host", url)
                        .config("spark.redis.port", port)
                        .getOrCreate();

                dbSystem = NoSqlDbSystem.Redis().Builder().port(port).sparkSession(spark).build();
                //localhost //6379
            }

            return null;


        }
    }
