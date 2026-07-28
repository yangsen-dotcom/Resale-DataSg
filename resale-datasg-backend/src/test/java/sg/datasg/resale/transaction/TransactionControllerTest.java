package sg.datasg.resale.transaction;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;
import sg.datasg.resale.transaction.dto.TransactionResponse;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @Test
    void listReturnsPagedResponse() throws Exception {
        TransactionResponse row = new TransactionResponse(1L, "2023-06", "BEDOK", "4 ROOM", "123",
            "BEDOK NORTH RD", "07 TO 09", new BigDecimal("92.0"), "New Generation", (short) 1980,
            "56 years 01 month", new BigDecimal("520000.00"));
        Page<TransactionResponse> page = new PageImpl<>(List.of(row), PageRequest.of(0, 20), 1);
        when(transactionService.list(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/transactions").param("town", "BEDOK"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].town").value("BEDOK"))
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    void invalidSortFieldReturns400() throws Exception {
        when(transactionService.list(any(), any())).thenThrow(new IllegalArgumentException("Invalid sort field"));

        mockMvc.perform(get("/api/transactions").param("sort", "flatModel,asc"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void townsReturnsDistinctList() throws Exception {
        when(transactionService.distinctTowns()).thenReturn(List.of("ANG MO KIO", "BEDOK"));

        mockMvc.perform(get("/api/transactions/towns"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value("ANG MO KIO"))
            .andExpect(jsonPath("$[1]").value("BEDOK"));
    }

    @Test
    void flatTypesReturnsDistinctList() throws Exception {
        when(transactionService.distinctFlatTypes()).thenReturn(List.of("2 ROOM", "3 ROOM"));

        mockMvc.perform(get("/api/transactions/flat-types"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value("2 ROOM"));
    }
}
