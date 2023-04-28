import { v4 as uuid } from 'uuid';
import { generatePaymentUrl } from '~/utils/utils';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import type { CryptoItemType, PaymentUrlOptions } from '~/utils/utils';
import { currencySymbol, paycekProfileCode, paycekSecret, uri } from '~/config.mjs';
import './tier.css';
import { useEffect, useState } from 'react';
import { Modal } from 'flowbite-react';
import { Icon } from '@iconify/react';
import ReactMarkdown from 'react-markdown';
import { DateTime } from 'luxon';

export interface TicketMethodProps {
  title: string;
  price: {
    standard?: number | string | null;
    patron?: number | string | null;
    sponsor?: number | string | null;
    crew?: number | string | null;
    metagamer?: number | string | null;
  };
  discount: number | null;
  isEarlyBird?: boolean;
  earlyBirdExpires?: string;
  summary: string;
  method: string;
  ctaText: string;
}

export type TicketMethodType = {
  title: string;
  price: {
    standard?: number | string | null;
    patron?: number | string | null;
    sponsor?: number | string | null;
    crew?: number | string | null;
    metagamer?: number | string | null;
  };
  discount: number | null;
  isEarlyBird?: boolean;
  earlyBirdExpires?: string;
  summary: string;
  method: string;
  ctaText: string;
};

export interface BuyButtonProps {
  text: string;
  prices?: TicketMethodType['price'];
  discount?: number | null;
  disabled?: boolean;
  isEarlyBird?: TicketMethodType['isEarlyBird'];
  earlyBirdExpires?: TicketMethodType['earlyBirdExpires'];
}

export interface PayloadOptions {
  total: string;
  items: CryptoItemType[];
}

const activeBtnClasses =
  'btn btn-ghost bg-gradient-tertiary  text-secondary hover:scale-95 focus:outline-dashed focus:outline-primary w-auto';
const disabledBtnClasses =
  'btn btn-ghost btn-disabled bg-gradient-tertiary text-secondary focus:outline-dashed focus:outline-primary w-auto opacity-50 cursor-not-allowed';

export const FiatButton = ({ text, disabled }: BuyButtonProps): JSX.Element => {
  const classes = disabled ? disabledBtnClasses : activeBtnClasses;

  return (
    <button
      data-buy-method="fiat"
      className={classes}
      data-tally-open="mRx81K"
      data-tally-layout="modal"
      data-tally-width="800"
      data-tally-align-left="1"
      data-tally-emoji-text="👋"
      data-tally-emoji-animation="wave"
      data-tally-auto-close="10000"
      aria-disabled={disabled}
    >
      {text}
    </button>
  );
};

export const CryptoModalButton = ({
  text,
  prices,
  discount,
  isEarlyBird,
  earlyBirdExpires,
  disabled,
}: BuyButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityB, setQuantityB] = useState(1);
  const [basket, setBasket] = useState<CryptoItemType[]>([]);
  const [basketTotal, setBasketTotal] = useState(0);
  const earlyBirdDateFormated = DateTime.fromISO(earlyBirdExpires).toLocaleString(DateTime.DATE_SHORT);

  const toggleModal = () => {
    if (typeof window !== 'undefined') {
      const body = document.querySelector('body');
      if (body) {
        body.classList.toggle('overflow-hidden');
      }
    }
    setIsOpen(!isOpen);
  };

  const handlePurchase = (basketData: CryptoItemType[]) => {
    const payload = (total: PayloadOptions['total'], items: PayloadOptions['items']) => {
      return {
        profileID: paycekProfileCode,
        secretKey: paycekSecret,
        paymentID: uuid(),
        totalAmount: total,
        items: items,
        email: null,
        successUrl: `${uri}/tickets/success`,
        failUrl: `${uri}/tickets/failed`,
        backUrl: `${uri}/tickets`,
        statusUrlCallback: '',
        description: '',
        language: 'en',
      } as PaymentUrlOptions;
    };

    // get the total amount of the basket
    const total = basketData.reduce((acc, item) => {
      return acc + parseFloat(item.amount);
    }, 0);

    const data = payload(total.toFixed(2), basketData);

    const url = generatePaymentUrl(data);

    window.location.assign(url);
  };

  /**
   * delete an item from the basket and subtract the quantity and total from the basket total
   */
  const removeFromBasket = (name: string) => {
    const updatedBasket = basket.filter((item) => item.name !== name);
    const total = updatedBasket.reduce((acc, item) => {
      return acc + parseFloat(item.amount);
    }, 0);
    setBasketTotal(total);

    setBasket(updatedBasket);
  };

  /**
   * add an item to the basket
   * @param tier - the tier of the item to be added to the basket
   */
  const addToBasket = (tier: string) => {
    const amountInput = document.querySelector('input[name="amount"]');
    const amount = amountInput.getAttribute('value');
    const nameInput = document.querySelector('input[name="name"]');
    const name = nameInput.getAttribute('value');
    const patronAmountInput = document.querySelector('input[name="patronAmount"]');
    const patronAmount = patronAmountInput.getAttribute('value');
    const patronNameInput = document.querySelector('input[name="patronName"]');
    const patronName = patronNameInput.getAttribute('value');

    /**
     *  if an item of the same type is already in the basket, update the quantity and total instead of adding a new item, if not, add a new item to the basket and update the basket total
     */
    const itemExists = basket.find((item) => item.name === name);
    const patronItemExists = basket.find((item) => item.name === patronName);

    if (tier === 'standard') {
      if (itemExists) {
        const updatedItem = {
          ...itemExists,
          units: itemExists.units + quantity,
          amount: (parseFloat(amount) * (itemExists.units + quantity)).toFixed(2),
        };
        const updatedBasket = basket.map((item) => {
          if (item.name === name) {
            return updatedItem;
          }
          return item;
        });
        setBasket(updatedBasket);
        setBasketTotal(basketTotal + parseFloat(amount) * quantity);
      } else {
        const total = (parseFloat(amount) * quantity).toFixed(2);
        const standardItem = { name, units: quantity, amount: total };
        setBasket([...basket, standardItem]);
        setBasketTotal(+(basketTotal + parseFloat(amount) * quantity).toFixed(2));
      }
    }

    if (tier === 'patron') {
      if (patronItemExists) {
        const updatedItem = {
          ...patronItemExists,
          units: patronItemExists.units + quantityB,
          amount: (parseFloat(patronAmount) * (patronItemExists.units + quantityB)).toFixed(2),
        };
        const updatedBasket = basket.map((item) => {
          if (item.name === patronName) {
            return updatedItem;
          }
          return item;
        });
        setBasket(updatedBasket);
        setBasketTotal(basketTotal + parseFloat(patronAmount) * quantityB);
      } else {
        const total = (parseFloat(patronAmount) * quantityB).toFixed(2);
        const patronItem = { name: patronName, units: quantityB, amount: total };
        setBasket([...basket, patronItem]);
        setBasketTotal(+(basketTotal + parseFloat(patronAmount) * quantityB).toFixed(2));
      }
    }
  };

  const patronTicketCount = useMotionValue(0);
  const standardTicketCount = useMotionValue(0);
  const basketCount = useMotionValue(0);
  const patronUnitsCount = useMotionValue(0);
  const standardUnitsCount = useMotionValue(0);

  const patronRounded = useTransform(patronTicketCount, (latest) => Math.round(latest));
  const standardRounded = useTransform(standardTicketCount, (latest) => Math.round(latest));
  const basketRounded = useTransform(basketCount, (latest) => Math.round(latest));
  const patronUnitsRounded = useTransform(patronUnitsCount, (latest) => Math.round(latest));
  const standardUnitsRounded = useTransform(standardUnitsCount, (latest) => Math.round(latest));

  const classes = disabled ? disabledBtnClasses : activeBtnClasses;

  useEffect(() => {
    const basketStandard = basket.find((item) => item.name === 'Standard Ticket');
    const basketPatron = basket.find((item) => item.name === 'Patron Ticket');

    const patronControls = animate(patronTicketCount, basketPatron ? parseFloat(basketPatron.amount) : 0);
    const standardControls = animate(standardTicketCount, basketStandard ? parseFloat(basketStandard.amount) : 0);
    const patronUnitsControls = animate(patronUnitsCount, basketPatron ? basketPatron.units : 0);
    const standardUnitsControls = animate(standardUnitsCount, basketStandard ? basketStandard.units : 0);
    const basketControls = animate(basketCount, basketTotal);

    return () => {
      patronControls.stop();
      standardControls.stop();
      patronUnitsControls.stop();
      standardUnitsControls.stop();
      basketControls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basketTotal]);

  return (
    <>
      <button className={classes} onClick={toggleModal} aria-disabled={disabled}>
        {text}
      </button>
      <Modal
        id="cryptoPayModal"
        show={isOpen}
        dismissible={true}
        position="center"
        size="xl"
        onClose={toggleModal}
        className="mf-modal backdrop-blur-md bg-gradient-to-b from-primary-alpha-30 to-accent-alpha-30 min-h-full transition-all duration-500 ease-in-out"
      >
        <Modal.Header className="modal-header">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent text-2xl md:text-5xl">
            Buy with Crypto
          </span>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <div className="flex flex-col items-start justify-center space-y-2 md:space-y-3">
            <p className="text-lg md:text-xl text-off-white flex items-center justify-between w-full mb-0">
              <span className="flex-grow">Standard Tickets</span>{' '}
              {isEarlyBird && (
                <span
                  className="text-sm md:text-base self-end line-through inline-flex -translate-y-6 translate-x-3 -rotate-12"
                  aria-label={`Normal price ${currencySymbol}${prices.standard}`}
                >
                  {currencySymbol}
                  {prices.standard}
                </span>
              )}
              <span
                className="text-2xl md:text-3xl font-bold"
                aria-label={`Discounted early bird price ${currencySymbol}${applyDiscount(prices.standard, discount)}`}
              >
                {currencySymbol}
                {applyDiscount(prices.standard, discount)}
                {isEarlyBird && `*`}
              </span>
            </p>
            <p className="text-lg md:text-xl text-off-white flex items-center justify-between w-full mb-0">
              <span className="flex-grow relative bg-clip-text text-transparent bg-gradient-to-r from-tertiary to-accent">
                Patron Tickets
                <b role="img" aria-label="sparkles emoji">
                  ✨
                </b>
              </span>
              {isEarlyBird && (
                <span
                  className="text-sm md:text-base self-end line-through inline-flex -translate-y-6 translate-x-3 -rotate-12"
                  aria-label={`Normal price ${currencySymbol}${prices.patron}`}
                >
                  {currencySymbol}
                  {prices.patron}
                </span>
              )}
              <span
                className="text-2xl md:text-3xl font-bold"
                aria-label={`Discounted early bird price ${currencySymbol}${applyDiscount(prices.patron, discount)}`}
              >
                {currencySymbol}
                {applyDiscount(prices.patron, discount)}
                {isEarlyBird && `*`}
              </span>
            </p>

            <p className="text-xs md:text-sm">
              Just select the number of each ticket you want to buy, add to your crypto cart then hit &apos;Buy&apos;
              when you&apos;re done. You&apos;ll be re-directed to the payment page on the{' '}
              <a href="https://paycek.io" target="_blank" rel="noreferrer">
                Paycek website
              </a>{' '}
              to complete your purchase using your choice of crypto.
            </p>
            {isEarlyBird && (
              <p className="text-primary text-xs md:text-sm italic">
                *Earlybird prices ({discount}% discount) until {earlyBirdDateFormated}
              </p>
            )}
            <div className="flex flex-row items-center justify-center space-y-2 md:space-y-3 w-full">
              <input type="hidden" name="amount" value={applyDiscount(prices.standard, discount)} />
              <input type="hidden" name="name" value="Standard Ticket" />
              <div className="form-control">
                <label className="input-group input-group-sm justify-center" htmlFor="quantity">
                  <span className="w-1/2 md:w-1/4 bg-off-white font-bold text-secondary-dark uppercase">Standard</span>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(+e.target.value)}
                    className="input font-bold text-center text-xl md:text-2xl w-3/12"
                  />
                  <button
                    data-buy-method="crypto"
                    className="btn btn-ghost bg-gradient-tertiary text-secondary ticket-method w-auto focus:outline-dashed focus:outline-primary"
                    onClick={() => addToBasket('standard')}
                  >
                    <Icon icon="mdi:cart-plus" className="w-7 h-7 md:w-5 md:h-5" />
                    <span className="hidden md:block bg-transparent">Add to cart</span>
                  </button>
                </label>
              </div>
            </div>

            <div className="flex flex-row items-center justify-center space-y-2 md:space-y-3 w-full">
              <input type="hidden" name="patronAmount" value={applyDiscount(prices.patron, discount)} />
              <input type="hidden" name="patronName" value="Patron Ticket" />
              <div className="form-control w-full">
                <label className="input-group input-group-sm  justify-center w-full" htmlFor="quantityB">
                  <span className="w-1/2 md:w-1/4 bg-gradient-to-r from-tertiary to-accent font-bold text-secondary-dark uppercase">
                    Patron
                  </span>
                  <input
                    type="number"
                    name="quantityB"
                    id="quantityB"
                    value={quantityB}
                    min="1"
                    onChange={(e) => setQuantityB(+e.target.value)}
                    className="input font-bold text-center  text-xl md:text-2xl w-3/12"
                  />
                  <button
                    data-buy-method="crypto"
                    className="btn btn-ghost bg-gradient-tertiary text-secondary ticket-method w-auto focus:outline-dashed focus:outline-primary"
                    onClick={() => addToBasket('patron')}
                  >
                    <Icon icon="mdi:cart-plus" className="w-7 h-7 md:w-5 md:h-5" />
                    <span className="hidden md:block bg-transparent">Add to cart</span>
                  </button>
                </label>
              </div>
            </div>
            <AnimatePresence>
              {basket && basket.length > 0 && (
                <motion.div
                  className="flex flex-col items-start justify-center space-y-3 w-full"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.3, delay: 0 }}
                >
                  <p className="mb-0 flex w-full items-center font-bold justify-between">
                    <span>Your cart</span> <Icon icon="mdi:cart-variant" className="w-6 h-6 md:w-8 md:h-8" />
                  </p>
                  <motion.table
                    className="table table-compact w-full table-zebra"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.3, delay: 0 }}
                  >
                    <thead>
                      <tr>
                        <th>Ticket type</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody className="text-off-white text-xs">
                      {basket.map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <td>{item.name}</td>
                          <td className="text-center">
                            <motion.span>
                              {item.name === 'Patron Ticket' ? patronUnitsRounded : standardUnitsRounded}
                            </motion.span>
                          </td>
                          <td className="text-right">
                            {currencySymbol}
                            <motion.span>{item.name === 'Patron Ticket' ? patronRounded : standardRounded}</motion.span>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-circle btn-xs btn-error w-auto focus:outline-dashed focus:outline-red-400"
                              onClick={() => removeFromBasket(item.name)}
                            >
                              <span className="sr-only">Remove</span>{' '}
                              <Icon icon="mdi:delete-forever" className="w-full h-full" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                      <tr>
                        <td></td>
                        <td className="text-right">Total</td>
                        <td className="text-right">
                          {currencySymbol}
                          <motion.span>{basketRounded}</motion.span>
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </motion.table>
                  <div className="flex items-center justify-between w-full">
                    <div className="tooltip tooltip-accent" data-tip="Powered by Paycek">
                      <a href="https://paycek.io" target="_blank" rel="noreferrer">
                        <img src="/assets/images/paycek.svg" alt="Paycek logo" className="w-24 h-auto" />
                      </a>
                    </div>
                    <button
                      className="btn btn-ghost bg-gradient-tertiary text-secondary w-1/3 focus:outline-dashed focus:outline-primary self-end"
                      onClick={() => handlePurchase(basket)}
                    >
                      Buy
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export const SeedButton = ({ text, disabled }: BuyButtonProps): JSX.Element => {
  const classes = disabled ? disabledBtnClasses : activeBtnClasses;

  return (
    <button
      data-buy-method="seed"
      className={classes}
      data-tally-open="wL9okp"
      data-tally-layout="modal"
      data-tally-width="800"
      data-tally-align-left="1"
      data-tally-emoji-text="👋"
      data-tally-emoji-animation="wave"
      data-tally-auto-close="5000"
      aria-disabled={disabled}
    >
      {text}
    </button>
  );
};

export const SponsorButton = ({ text, disabled }: BuyButtonProps): JSX.Element => {
  const classes = disabled ? disabledBtnClasses : activeBtnClasses;

  return (
    <a href="/event-sponsors" data-buy-method="sponsor" className={classes}>
      {text}
    </a>
  );
};

export const CrewButton = ({ text, disabled }: BuyButtonProps): JSX.Element => {
  const classes = disabled ? disabledBtnClasses : activeBtnClasses;

  return (
    <button
      data-buy-method="crew"
      className={classes}
      data-tally-open="nG675k"
      data-tally-layout="modal"
      data-tally-width="800"
      data-tally-align-left="1"
      data-tally-emoji-text="👋"
      data-tally-emoji-animation="wave"
      data-tally-auto-close="5000"
      aria-disabled={disabled}
    >
      {text}
    </button>
  );
};

export const MetagamerButton = ({ text, disabled }: BuyButtonProps): JSX.Element => {
  const classes = disabled ? disabledBtnClasses : activeBtnClasses;

  return (
    <button
      data-buy-method="metagamer"
      className={classes}
      data-tally-open="mRxrkj"
      data-tally-layout="modal"
      data-tally-width="800"
      data-tally-align-left="1"
      data-tally-emoji-text="👋"
      data-tally-emoji-animation="wave"
      data-tally-auto-close="5000"
      aria-disabled={disabled}
    >
      {text}
    </button>
  );
};
export const applyDiscount = (price: number | string, discount: number) => {
  if (!discount || discount === 0) {
    return price;
  }
  if (typeof price === 'string') {
    return price;
  }
  return price - (price * discount) / 100;
};

export const TicketMethod = ({
  title,
  summary,
  method,
  ctaText,
  price,
  discount,
  isEarlyBird,
  earlyBirdExpires,
}: TicketMethodProps): JSX.Element => {
  const handleMethod = (method: string, cta: string) => {
    switch (method) {
      case 'fiat':
        return <FiatButton text={cta} />;
      case 'crypto':
        return (
          <CryptoModalButton
            text={cta}
            prices={price}
            isEarlyBird={isEarlyBird}
            earlyBirdExpires={earlyBirdExpires}
            discount={discount}
          />
        );
      case 'seeds':
        return <SeedButton text={cta} />;
      case 'sponsor':
        return <SponsorButton text={cta} />;
      case 'crew':
        return <CrewButton text={cta} />;
      case 'metagamer':
        return <MetagamerButton text={cta} />;
      default:
        return null;
    }
  };

  const isExternal = summary.includes('http');
  const earlyBirdDateFormated = DateTime.fromISO(earlyBirdExpires).toLocaleString(DateTime.DATE_SHORT);

  return (
    <div className="ticket-method">
      <motion.div
        className="ticket-method__header text-left"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="mb-3 uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {title}
        </h4>
      </motion.div>
      <motion.div
        className="ticket-method__content relative text-left p-0 rounded-2xl flex-grow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-3 md:p-5 z-10 rounded-2xl bg-gradient-to-b from-secondary to-secondary-dark-alpha-60 flex flex-col items-stretch h-full space-y-2 md:space-y-6">
          <div className="mb-0 text-sm md:text-xl text-primary flex-grow">
            <ReactMarkdown linkTarget={isExternal ? '_blank' : ''}>{summary}</ReactMarkdown>
          </div>
          {isEarlyBird && (
            <p className="text-primary text-xs md:text-sm italic">
              *Earlybird prices ({discount}% discount) until {earlyBirdDateFormated}
            </p>
          )}
          {price.standard && (
            <p className="text-lg md:text-xl text-off-white flex items-center justify-between w-full">
              <span className="flex-grow">Standard tickets</span>
              {isEarlyBird && (
                <span
                  className="text-sm md:text-base line-through inline-flex -translate-y-5 translate-x-3 -rotate-12"
                  aria-label={`Normal price ${currencySymbol}${price.standard}`}
                >
                  {price.standard > 0 && currencySymbol}
                  {price.standard}
                </span>
              )}
              <span
                className="text-2xl md:text-3xl font-bold uppercase"
                aria-label={`Discounted early bird price ${currencySymbol}${applyDiscount(price.standard, discount)}`}
              >
                {price.standard > 0 && currencySymbol}
                {applyDiscount(price.standard, discount)}
                {isEarlyBird && `*`}
              </span>
            </p>
          )}
          {price.patron && (
            <p className="text-lg md:text-xl text-off-white flex items-center justify-between w-full">
              <span className="flex-grow relative bg-clip-text text-transparent bg-gradient-to-r from-tertiary to-accent">
                Patron tickets
                <b role="img" aria-label="sparkles emoji">
                  ✨
                </b>
              </span>
              {isEarlyBird && (
                <span
                  className="text-sm md:text-base line-through inline-flex -translate-y-5 translate-x-3 -rotate-12"
                  aria-label={`Normal price ${currencySymbol}${price.patron}`}
                >
                  {price.patron > 0 && currencySymbol}
                  {price.patron}
                </span>
              )}
              <span
                className="text-2xl md:text-3xl font-bold uppercase"
                aria-label={`Discounted early bird price ${currencySymbol}${applyDiscount(price.patron, discount)}`}
              >
                {price.patron > 0 && currencySymbol}
                {applyDiscount(price.patron, discount)}
                {isEarlyBird && `*`}
              </span>
            </p>
          )}
          {price.sponsor && (
            <p className="text-lg md:text-xl text-off-white flex items-center justify-between w-full">
              <span className="relative bg-clip-text text-transparent bg-gradient-to-l from-cyan-400 to-fuchsia-500">
                Sponsor tickets<span aria-label="money bag emoji">💰</span>
              </span>
              <span className="text-2xl md:text-3xl font-bold uppercase">
                {price.sponsor > 0 && currencySymbol}
                {applyDiscount(price.sponsor, discount)}
              </span>
            </p>
          )}
          {price.crew && (
            <p className="text-lg md:text-xl text-off-white flex items-center justify-between w-full">
              <span className="relative bg-clip-text text-transparent bg-gradient-to-l from-purple-500 to-cyan-400">
                Contributor tickets{' '}
                <b role="img" aria-label="octopus emoji">
                  🐙
                </b>
              </span>
              <span className="text-2xl md:text-3xl font-bold uppercase">
                {price.crew > 0 && currencySymbol}
                {applyDiscount(price.crew, discount)}
              </span>
            </p>
          )}
          {price.metagamer && (
            <p className="text-lg md:text-xl text-off-white flex items-center justify-between w-full">
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-fuchsia-400">
                MetaGamer tickets{' '}
                <img
                  src="https://metagame.wtf/favicon.png"
                  alt="MetaGame"
                  className="inline-flex items-center h-5 w-auto -translate-x-2 -translate-y-1"
                />
              </span>
              <span className="text-2xl md:text-3xl font-bold uppercase">
                {price.metagamer > 0 && currencySymbol}
                {applyDiscount(price.metagamer, discount)}
              </span>
            </p>
          )}

          <div className="text-center w-full self-end">{handleMethod(method, ctaText)}</div>
        </div>
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-accent to-transparent -z-10 pointer-events-none" />
      </motion.div>
    </div>
  );
};
