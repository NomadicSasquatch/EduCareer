// tests/whitebox/contactUs.whitebox.frontend.test.tsx
import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import ContactUsPage from "../../src/view/ContactFeedbackPage";

// Global fetch is stubbed (mocked) to simulate backend responses.
global.fetch = jest.fn();

describe("ContactUsPage Whitebox Tests - Basis Path Analysis", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should call fetch with correct parameters on successful form submission", async () => {
    const tmp: any = fetch;
    const fetchMock = tmp as jest.Mock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Feedback submitted successfully" }),
    });

    render(<ContactUsPage />);
    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Subject"), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your message"), {
      target: { value: "Test message content" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const fetchCall = fetchMock.mock.calls[0];
    const requestUrl = fetchCall[0];
    const requestOptions = fetchCall[1];

    expect(requestUrl).toContain(`http://localhost:`);
    expect(requestOptions.method).toBe("POST");
    expect(requestOptions.headers).toEqual({
      "Content-Type": "application/json",
    });

    const requestBody = JSON.parse(requestOptions.body);
    expect(requestBody).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
      subject: "Test Subject",
      message: "Test message content",
    });
  });


  test("should display an error message when fetch returns an error response", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Submission failed" }),
    });

    render(<ContactUsPage />);
    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Subject"), {
      target: { value: "Feedback" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your message"), {
      target: { value: "Test feedback" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() =>
      expect(screen.getByText(/Submission failed/i)).toBeInTheDocument()
    );
  });
});
