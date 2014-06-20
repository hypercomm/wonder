import java.util.*;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.sockjs.SockJSServer;
import org.vertx.java.deploy.Verticle;
import org.vertx.java.core.eventbus.EventBus;


/**
 * @author <a href="http://tfox.org">Tim Fox</a>
 */
public class server extends Verticle {
	
	//Declarar variaveis globais.
	
	public void start() throws Exception {
			
		try{
			//####Modules Configuration#####//
			//Modules WebServer Configuration
			JsonArray arrayinbound = new JsonArray("[{}]");
			JsonArray arrayoutbound = new JsonArray("[{}]");
			JsonObject configWebServer = new JsonObject();
			configWebServer.putString("host", "172.29.32.227");
			//configWebServer.putString("host", "172.29.32.236");
			configWebServer.putNumber("port", 4443);
			configWebServer.putArray("inbound_permitted", arrayinbound);
			configWebServer.putArray("outbound_permitted", arrayoutbound);
			configWebServer.putBoolean("bridge", true);

			container.deployModule("vertx.web-server-v1.0", configWebServer);
			//configWebServer.putBoolean("ssl", true);
			//configWebServer.putString("key_store_password", "webrtc");

			//Modules Mongo Persistor Configuration
			JsonObject configMongo = new JsonObject();
			configMongo.putString("address", "test.my_persistor");
			configMongo.putString("db_name", "webrtc");

			//Modules Session Manager Configuration
			JsonObject configSessions = new JsonObject();
			configSessions.putString("address", "test.session_manager");
			configSessions.putString("cleaner", "test.session_cleanup");
			configSessions.putString("prefix", "session_client.");
			configSessions.putNumber("timeout", 1000*60*1000);
	
			JsonObject configSessionsDB = new JsonObject();
			configSessionsDB.putString("address", "test.my_persistor"); 
			configSessionsDB.putString("collection", "conversation_sessions"); 
			
			configSessions.putObject("mongo-sessions", configSessionsDB);

			//Modules Declaration*/
			
			container.deployModule("com.campudus.session-manager-v1.2.1", configSessions);
			
			container.deployModule("vertx.mongo-persistor-v1.2", configMongo);
			container.deployModule("com.ptin.conversationmanager-v1.0");
            

		} catch (Exception ex) {
			System.out.println("error: "+ex.toString());
		} 
		
	}
}
