package health

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Check() (map[string]string, error) {
	return map[string]string{
		"status": "healthy",
	}, nil
}
