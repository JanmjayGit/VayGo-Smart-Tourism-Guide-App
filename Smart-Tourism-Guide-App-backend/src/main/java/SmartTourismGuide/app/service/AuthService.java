package SmartTourismGuide.app.service;


import SmartTourismGuide.app.dto.request.ForgotPasswordRequest;
import SmartTourismGuide.app.dto.request.LoginDto;
import SmartTourismGuide.app.dto.request.ResetPasswordRequest;
import SmartTourismGuide.app.dto.request.SignupDto;
import SmartTourismGuide.app.dto.response.ApiResponseDto;
import SmartTourismGuide.app.dto.response.JwtResponseDto;

public interface AuthService {
    JwtResponseDto authenticateUser(LoginDto loginDto);

    ApiResponseDto registerUser(SignupDto signupDto);
    ApiResponseDto forgotPassword(ForgotPasswordRequest request);
    ApiResponseDto resetPassword(ResetPasswordRequest request);
}
