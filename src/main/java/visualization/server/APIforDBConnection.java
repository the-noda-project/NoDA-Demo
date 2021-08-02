package visualization.server;
import gr.ds.unipi.noda.api.client.NoSqlDbSystem;
import org.apache.spark.sql.SparkSession;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static visualization.visualization.Visualize.dbSystem;
import static visualization.visualization.Visualize.spark;


    @RestController
    public class APIforDBConnection {

        @RequestMapping(value = "/db-connection/redis", method = RequestMethod.POST)
        @ResponseBody
        public String connectToRedis(@RequestBody Map<String, String> json) throws Exception {
            System.out.println(json.get("db") + " /// " + json.get("dbName") + " /// " + json.get("url") + " /// " + json.get("port") + " /// " + json.get("username") + " /// " + json.get("password") + " /// ");

            spark = SparkSession
                    .builder()
                    .appName("redis-df")
                    .master("local[*]")
                    .config("spark.redis.host", json.get("url"))
                    .config("spark.redis.port", json.get("port"))
                    .getOrCreate();

            dbSystem = NoSqlDbSystem.Redis().Builder().port(Integer.parseInt(json.get("port"))).sparkSession(spark).soTimeout(0).connectionTimeout(0).build();
            //localhost //6379

            return "Connected to Redis";
        }

        @RequestMapping(value = "/db-connection/mongodb", method = RequestMethod.POST)
        @ResponseBody
        public String connectToMongoDB(@RequestBody Map<String, String> json) throws Exception {
            System.out.println(json.get("db") + " /// " + json.get("dbName") + " /// " +json.get("url")  + " /// " +json.get("port") + " /// " + json.get("username") + " /// " + json.get("password") + " /// " + json.get("collection") + " /// " );

            spark = SparkSession
                    .builder()
                    .appName("Application Name").master("local").config("spark.mongodb.input.database",json.get("dbName")).config("spark.mongodb.input.collection", json.get("collection"))
                    .config("spark.mongodb.input.uri", "mongodb://"+ json.get("username") +":"+ json.get("password") +"@"+ json.get("url") +":"+ json.get("port"))
                    .getOrCreate();

            dbSystem = NoSqlDbSystem.MongoDB().Builder(json.get("username"),json.get("password"),json.get("dbName")).host(json.get("url")).port(Integer.parseInt(json.get("port"))).sparkSession(spark).build();
            //nikos //12345 //admin //127.0.0.1 //27017

            return "Connected to MongoDB";
        }


        @RequestMapping(value = "/db-connection/hbase", method = RequestMethod.POST)
        @ResponseBody
        public String connectToHBASE(@RequestBody Map<String, String> json) throws Exception {
            System.out.println(json.get("db") + " /// " + json.get("dbName") + " /// " + json.get("url") + " /// " + json.get("port") + " /// " + json.get("username") + " /// " + json.get("password") + " /// ");

            spark = SparkSession
                        .builder()
                        .appName("Application Name").master("local")
                        .getOrCreate();

            dbSystem = NoSqlDbSystem.HBase().Builder().port(Integer.parseInt(json.get("port"))).sparkSession(spark).build();
            //2181

            return "Connected to Hbase";
        }





        @RequestMapping(value = "/db-connection/neo4j", method = RequestMethod.POST)
        @ResponseBody
        public String connectToNeo4j(@RequestBody Map<String, String> json) throws Exception {
            System.out.println(json.get("db") + " /// " + json.get("dbName") + " /// " + json.get("url") + " /// " + json.get("port") + " /// " + json.get("username") + " /// " + json.get("password") + " /// ");

            spark = SparkSession
                        .builder()
                        .appName("Application Name").master("local")
                        .config("spark.neo4j.user", json.get("username"))
                        .config("spark.neo4j.password", json.get("password"))
                        .config("spark.neo4j.url","bolt://"+ json.get("url") +":" + json.get("port"))
                        .getOrCreate();

             dbSystem = NoSqlDbSystem.Neo4j().Builder(json.get("username"), json.get("password")).host(json.get("url")).port(Integer.parseInt(json.get("port"))).sparkSession(spark).build();
                //neo4j //nikos //localhost //7687

            return "Connected to Neo4j";
        }


        @RequestMapping(value = "/close-connection", method = RequestMethod.POST)
        @ResponseBody
        public String closeConnection(@RequestBody Map<String, String> json) throws Exception {
            System.out.println(" /// " + json.get("hasAlreadyConnection") + " /// ");

            System.out.println(" /// DISCONECTED /// ");

            spark.close();
            dbSystem.closeConnection();

            System.out.println(" /// DISCONECTED 1 /// ");

            return "Connection Closed";
        }


    }
