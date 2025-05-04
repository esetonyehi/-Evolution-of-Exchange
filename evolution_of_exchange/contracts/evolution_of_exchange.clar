;; The Evolution of Exchange
;; A smart contract representing the evolution of payment systems
;; Written in Clarity for the Stacks blockchain, using Clarinet testing framework

;; Define the contract
(define-public (evolution-of-exchange)
  (ok "Evolution of Exchange initialized"))

;; Define constants for historical eras of exchange
(define-constant BARTER_ERA u1)
(define-constant COMMODITY_MONEY_ERA u2)
(define-constant METALLIC_MONEY_ERA u3)
(define-constant PAPER_MONEY_ERA u4)
(define-constant DIGITAL_MONEY_ERA u5)
(define-constant CRYPTO_ERA u6)

;; Define data map for tracking exchanges
(define-map exchanges uint {
  era: uint,
  method: (string-ascii 24),
  description: (string-ascii 100),
  year-introduced: uint,
  is-current: bool
})
;; Initialize exchange methods throughout history
(define-public (initialize-exchange-history)
  (begin
    (map-set exchanges u1 {
      era: BARTER_ERA,
      method: "Barter",
      description: "Direct exchange of goods and services",
      year-introduced: u9000,
      is-current: false
    })
    (map-set exchanges u2 {
      era: COMMODITY_MONEY_ERA,
      method: "Commodity Money",
      description: "Using items with inherent value as medium of exchange",
      year-introduced: u5000,
      is-current: false
    })
    (map-set exchanges u3 {
      era: METALLIC_MONEY_ERA,
      method: "Coins",
      description: "Standardized metal pieces with assigned value",
      year-introduced: u600,
      is-current: false
    })
    (map-set exchanges u4 {
      era: PAPER_MONEY_ERA,
      method: "Paper Currency",
      description: "Paper notes representing stored value",
      year-introduced: u1700,
      is-current: true
    })
    (map-set exchanges u5 {
      era: DIGITAL_MONEY_ERA,
      method: "Digital Banking",
      description: "Electronic transfers and digital account balances",
      year-introduced: u1970,
      is-current: true
    })
    (map-set exchanges u6 {
      era: CRYPTO_ERA,
      method: "Cryptocurrency",
      description: "Decentralized digital currencies based on blockchain",
      year-introduced: u2009,
      is-current: true
    })
    (ok true)
  )
)

;; Function to simulate an exchange in a particular era
(define-public (perform-exchange (era uint) (amount uint) (sender principal) (recipient principal))
  (let ((exchange-method (unwrap! (map-get? exchanges era) (err u404))))
    (if (get is-current exchange-method)
      (begin
        ;; If using current method, process the exchange
        (print (concat "Processing exchange using: " (get method exchange-method)))
        (print (concat "Amount: " (some-uint-to-string amount)))
        ;; Simply print that an exchange is happening instead of converting principals
        (print "Exchange completed between sender and recipient")
        (ok true)
      )
      ;; If using historical method, return educational message
      (begin
        (print (concat "Historical demonstration of: " (get method exchange-method)))
        (print (concat "This method was introduced around " 
               (concat (some-uint-to-string (get year-introduced exchange-method)) " BCE/CE")))
        (print (get description exchange-method))
        (ok false)
      )
    )
  )
)

;; Function to get information about a specific exchange era
(define-read-only (get-exchange-info (era uint))
  (map-get? exchanges era)
)

;; Function to check if an exchange method is currently in use
(define-read-only (is-exchange-method-current (era uint))
  (default-to false (get is-current (map-get? exchanges era)))
)

;; Simple function to convert small numbers to strings (avoiding complex fold operations)
(define-read-only (some-uint-to-string (value uint))
  (if (< value u10)
    (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") value))
    (if (< value u100)
      (concat 
        (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (/ value u10)))
        (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (mod value u10)))
      )
      (if (< value u1000)
        (concat 
          (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (/ value u100)))
          (concat
            (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (mod (/ value u10) u10)))
            (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (mod value u10)))
          )
        )
        (if (< value u10000)
          (concat 
            (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (/ value u1000)))
            (concat
              (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (mod (/ value u100) u10)))
              (concat
                (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (mod (/ value u10) u10)))
                (unwrap-panic (element-at (list "0" "1" "2" "3" "4" "5" "6" "7" "8" "9") (mod value u10)))
              )
            )
          )
          "many" ;; Default for very large numbers
        )
      )
    )
  )
)

;; Simulated musical elements representing different exchange eras
(define-public (play-era-theme (era uint))
  (let ((exchange-method (unwrap! (map-get? exchanges era) (err u404))))
    (begin
      (print (concat "Playing musical theme for: " (get method exchange-method)))
      
      ;; Different musical characteristics for each era
      (if (is-eq era BARTER_ERA)
        (print "Musical theme: Simple, primal rhythms with call and response patterns")
        (if (is-eq era COMMODITY_MONEY_ERA)
          (print "Musical theme: Steady, repeated motifs representing stability of commodity value")
          (if (is-eq era METALLIC_MONEY_ERA)
            (print "Musical theme: Bright, metallic tones with structured harmonic progression")
            (if (is-eq era PAPER_MONEY_ERA)
              (print "Musical theme: Light, flowing melodies with occasional uncertainty")
              (if (is-eq era DIGITAL_MONEY_ERA)
                (print "Musical theme: Fast-paced, technical passages with electronic elements")
                (if (is-eq era CRYPTO_ERA)
                  (print "Musical theme: Complex, decentralized musical structures with mathematical patterns")
                  (print "Musical theme: Unknown era theme")
                )
              )
            )
          )
        )
      )
      (ok true)
    )
  )
)

;; Test the contract with clarinet console
;; Run: clarinet console
;; Then: (contract-call? .evolution-of-exchange initialize-exchange-history)
;; And: (contract-call? .evolution-of-exchange play-era-theme u3)