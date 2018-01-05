rm(list=ls())

library(tidyverse)
library(readxl)
library(reshape2)
library(zoo)
library(ggrepel)
library(directlabels)
library(jsonlite)

setwd("/Users/ratulesrar/Desktop/data_viz/data_viz_pbpl/hw2/")

# Import daily pricestats data from MIT BPP
pricestats <- read_csv('pricestats_bpp_arg_usa.csv')
pricestats_usa <- pricestats %>% 
  filter(country == 'USA') %>%
  mutate(date = as.Date(date, '%d%b%Y'))

# Import quarterly OECD CPI Data
df <- read_csv("quarterly_inflation.csv")

ps <- pricestats_usa %>%
  mutate(index_val=indexPS,
         source="BPP") %>%
  select(date, index_val, source)

cpi <- df %>%
  mutate(index_val=bls_agg,
         source="CPI") %>%
  select(date, index_val, source)

food <- df %>%
  mutate(index_val=bls_food,
         source="FOOD") %>%
  select(date, index_val, source)

housing <- df %>%
  mutate(index_val=bls_housing,
         source="HOUSING") %>%
  select(date, index_val, source)

energy <- df %>%
  mutate(index_val=bls_energy,
         source="ENERGY") %>%
  select(date, index_val, source)

all <- bind_rows(ps, cpi, food, housing, energy)

all <- all %>%
  mutate(cpi=if_else(source=="CPI", 1, 0),
         daily=if_else(source=="BPP", 1, 0),
         food=if_else(source=="FOOD", 1, 0),
         housing=if_else(source=="HOUSING", 1, 0),
         energy=if_else(source=="ENERGY", 1, 0))

write_tsv(all, path="all_inflation.tsv")
