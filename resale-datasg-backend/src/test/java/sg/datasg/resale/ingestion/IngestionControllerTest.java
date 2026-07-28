package sg.datasg.resale.ingestion;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(IngestionController.class)
class IngestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IngestionService ingestionService;

    @Test
    void triggersAsyncIngestionWhenIdle() throws Exception {
        when(ingestionService.isIngestionInProgress()).thenReturn(false);

        mockMvc.perform(post("/api/admin/ingest"))
            .andExpect(status().isAccepted());

        verify(ingestionService).reingestAllAsync();
    }

    @Test
    void returnsConflictWhenAlreadyInProgress() throws Exception {
        when(ingestionService.isIngestionInProgress()).thenReturn(true);

        mockMvc.perform(post("/api/admin/ingest"))
            .andExpect(status().isConflict());
    }
}
