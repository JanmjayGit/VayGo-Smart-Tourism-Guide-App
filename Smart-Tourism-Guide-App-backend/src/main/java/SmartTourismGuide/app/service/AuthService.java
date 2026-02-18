package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.response.ApiResponseDto;
import SmartTourismGuide.app.dto.response.JwtResponseDto;
import SmartTourismGuide.app.dto.request.LoginDto;
import SmartTourismGuide.app.dto.request.SignupDto;

public interface AuthService {
    JwtResponseDto authenticateUser(LoginDto loginDto);

    ApiResponseDto registerUser(SignupDto signupDto);
}
