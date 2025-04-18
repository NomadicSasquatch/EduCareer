import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegistrationPage from '../../src/view/RegisterationPage';

const PORT = 3000;

global.fetch = jest.fn();

describe("RegistrationPage Whitebox Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Learner Registration - successful submission and auto-login", async () => {
    const fetchMock = fetch as unknown as jest.Mock;
    const registrationResponse = { user: { id: 1, username: "learnerUser", role: "learner" } };
    const loginResponse = { user: { id: 1, username: "learnerUser", role: "learner" } };

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => registrationResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => loginResponse,
      });

    render(
      <MemoryRouter>
        <RegistrationPage />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText("Enter a username"), {
      target: { value: "learnerUser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your first name"), {
      target: { value: "John" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your last name"), {
      target: { value: "Doe" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "john.doe@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
      target: { value: "12345678" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "password123" }
    });
    
    fireEvent.click(screen.getByRole("button", { name: /Register as Learner/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const registrationCall = fetchMock.mock.calls[0];
    const registrationUrl = registrationCall[0];
    const registrationOptions = registrationCall[1];
    expect(registrationUrl).toContain(`http://localhost:${PORT}/api/register`);
    expect(registrationOptions.method).toBe("POST");
    const regBody = JSON.parse(registrationOptions.body);
    expect(regBody).toMatchObject({
      username: "learnerUser",
      email: "john.doe@example.com",
      password: "password123",
      role: "learner",
      phone_number: "12345678",
      firstName: "John",
      lastName: "Doe",
      cover_image_url: "",
      profile_image_url: "",
      occupation: "",
      company_name: "",
      about_myself: ""
    });

    const loginCall = fetchMock.mock.calls[1];
    const loginUrl = loginCall[0];
    const loginOptions = loginCall[1];
    expect(loginUrl).toContain(`http://localhost:${PORT}/api/login`);
    expect(loginOptions.method).toBe("POST");
    const loginBody = JSON.parse(loginOptions.body);
    expect(loginBody).toMatchObject({
      username: "learnerUser",
      password: "password123"
    });
  });

  test("Provider Registration - error response displays error message", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Registration failed" }),
    });

    render(
      <MemoryRouter>
        <RegistrationPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /Provider/i }));

    // Fill in provider registration form fields.
    fireEvent.change(screen.getByPlaceholderText("Enter your first name"), {
      target: { value: "Alice" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your last name"), {
      target: { value: "Smith" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter a username"), {
      target: { value: "providerUser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "alice.smith@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Organization name"), {
      target: { value: "TechOrg" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
      target: { value: "87654321" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password456" }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "password456" }
    });

    fireEvent.click(screen.getByRole("button", { name: /Register as Provider/i }));

    await waitFor(() =>
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument()
    );

    const providerCall = (fetch as any).mock.calls[0];
    const providerUrl = providerCall[0];
    const providerOptions = providerCall[1];
    expect(providerUrl).toContain(`http://localhost:${PORT}/api/register`);
    expect(providerOptions.method).toBe("POST");
    const providerBody = JSON.parse(providerOptions.body);
    expect(providerBody).toMatchObject({
      username: "providerUser",
      email: "alice.smith@example.com",
      password: "password456",
      role: "provider",
      phone_number: "87654321",
      firstName: "Alice",
      lastName: "Smith",
      lecture_team_id: null,
      organization_name: "TechOrg",
      address: ""
    });
  });
});
