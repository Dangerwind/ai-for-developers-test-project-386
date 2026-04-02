package com.hexlet.calendar.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forward all non-API, non-static routes to index.html for SPA client-side routing.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {"/", "/book/**", "/admin", "/booking-success"})
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
